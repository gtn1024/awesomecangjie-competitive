---
oj: dmy
pid: '548'
title: '序列粘贴'
difficulty: 提高
tags:
  - 线性 DP
timeLimit: 1s
memoryLimit: 256m
---

> 数据规模：$1 \le T \le 10^4$，$1 \le n,m \le 3000$，$0 \le x,y,z \le 10^6$，$0 \le a_i,b_i \le 10^9$，$\sum nm \le 9\times 10^6$，$\sum(n+m) \le 2\times 10^5$。

## 思路

**编辑区的最终形态只由粘贴次数决定。** 粘贴是把完整的 $a$ 追加到末尾，删除不改变剩余元素的相对顺序，修改只改变某个元素的值。所以粘贴 $k$ 次之后，编辑区就是 $a$ 连着写 $k$ 遍，最终结果必须是它的子序列：删掉其中 $kn-m$ 个元素，再把留下的每个元素改成对应的 $b$ 值。于是一份方案的费用是

$$kx+(kn-m)z+y\sum_{t}|a_{j_t}-b_t|,$$

其中第 $t$ 个匹配把 $a$ 中的某个元素 $a_{j_t}$ 改成 $b_t$，而这个求和是多花在修改上的部分。

**粘贴的时机可以任意重排。** 每份拷贝在编辑区里的位置只取决于它是第几次粘贴，与何时粘贴无关；删除和修改也都只针对单个元素。所以一份「每份拷贝里哪些元素保留、保留的元素配给 $b$ 的哪一项」的分配方案，总可以按「先处理完当前拷贝的所有元素，再粘贴下一份」的顺序执行，费用不变。另外若某份拷贝里一个元素都没被保留，去掉这次粘贴只会让费用更小，故最优解中 $k\le m$。

**状态。** 设 $f[i][j]$ 表示：已经配好 $b$ 的前 $i$ 个元素，当前这份拷贝的前 $j$ 个元素都已经处理完（每个要么被删除、要么被匹配），并且已经付清了粘贴费与到目前为止的所有删除、修改费。$j=0$ 表示这份拷贝刚粘贴完、还没动。

在同一份拷贝内部（$j<n$）有两个选择：删掉第 $j+1$ 个元素，花 $z$；或者把它改成 $b_{i+1}$ 与之匹配，花 $y\,|a_{j+1}-b_{i+1}|$。当前拷贝用完后换下一份要再花 $x$。

**层内成环怎么办。** 直接按上式递推会出现 $f[i][n]\to f[i][0]\to f[i][1]\to\cdots\to f[i][n]$ 的环。但 $x,z\ge 0$，绕这个环一圈至少多花 $x$（外加若干次 $z$），不会让答案变小，所以可以只在「不绕圈」的范围内计算：先只允许从上一层进入本层。

固定层 $i$（$b$ 的前 $i$ 个已配好），记 $A[j]$ 为「本层内不再新粘贴、刚处理完当前拷贝的前 $j$ 个元素」的最小费用，则

$$A[0]=+\infty,\qquad A[j]=\min\big(A[j-1]+z,\ f_{i-1}[j-1]+y\,|a_j-b_i|\big).$$

第一项是删掉第 $j$ 个元素，第二项是把 $a_j$ 改成 $b_i$ 并把 $b_i$ 配掉（于是从上一层 $i-1$ 的 $j-1$ 走过来）。这两项各对应 $A[j]$ 的全部来源，因此 $A[j]$ 就是不含新粘贴的真实值。

**本层新粘贴的起点要取前缀最小值。** 想在本层新粘贴一份，必须先把当前拷贝剩下的元素全部删掉：若停在 $A[j]$，删掉余下 $n-j$ 个元素要花 $(n-j)z$，然后再花 $x$ 粘贴。于是

$$S_i=x+\min_{1\le j\le n}\big(A[j]+(n-j)z\big).$$

这里 $j$ 从 $1$ 开始：$j=0$ 意味着本层一个元素都没处理就到 $f[i][0]$，那是从上一层粘贴过来的，已经含在 $A$ 的递推里。有了 $S_i$ 后

$$f_i[j]=\min\big(A[j],\ S_i+jz\big),$$

第二项是「本层刚粘贴一份，把它的前 $j$ 个元素直接删掉」；$f_i[0]=S_i$。任何从 $S_i$ 出发、绕回 $S_i$ 的路径都只会多花 $x+(n-j)z\ge 0$，所以这两项已经足够。这一步把「对每个 $j$ 枚举换拷贝的位置」的 $O(n^2)$ 压成了对 $A[j]+(n-j)z$ 求一次前缀最小值，每层只花 $O(n)$。

**边界与答案。** 第 $0$ 层还没配任何 $b$：粘贴一份并把前 $j$ 个元素删掉，$f_0[j]=x+jz$。配完 $m$ 个元素后，当前拷贝剩下的 $n-j$ 个元素必须删掉，故

$$\text{ans}=\min_{0\le j\le n}\big(f_m[j]+(n-j)z\big).$$

其中 $j=0$ 的那一项含义是「配完之后又粘贴一份、再整份删掉」，它等于 $x+\min_j(A[j]+(n-j)z)+nz$，不小于 $A[n]$ 直接收尾的 $f_m[n]$，所以一并参与取最小不影响结果。

注意 $x,y,z$ 都可能为 $0$，推导里没有用到任何「费用为正才能提前退出」的假设，只用了 $x,z\ge 0$ 来排除绕环变小。

## 复杂度

每组数据 $O(nm)$ 时间。滚动数组加一个 $A$ 数组，额外空间 $O(n)$。总时间 $O(\sum nm)\le 9\times 10^6$。

## 仓颉实现

用两个长度 $n+1$ 的数组滚动保存相邻两层。每层先由上一层推出 $A$，再扫一遍求 $x+\min(A[j]+(n-j)z)$，最后合并出本层。最大费用约为 $m\cdot y\cdot 10^9\approx 3\times 10^{18}$，要用 64 位整数；$\infty$ 取 $4\times 10^{18}$，与 $z$ 相加仍在范围内。

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*

main() {
    let reader = getStdIn()
    let t = Int64.parse(reader.readln().getOrThrow())
    let INF: Int64 = 4000000000000000000
    for (_ in 0..t) {
        let head = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
        let n = head[0]
        let m = head[1]
        let x = head[2]
        let y = head[3]
        let z = head[4]
        let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
        let b = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
        let nn = n
        let prev = Array<Int64>(nn + 1, { _ => 0 })
        let cur = Array<Int64>(nn + 1, { _ => 0 })
        let A = Array<Int64>(nn + 1, { _ => INF })
        for (j in 0..=nn) {
            prev[j] = x + j * z
        }
        for (i in 1..=m) {
            let bi = b[i - 1]
            A[0] = INF
            for (j in 1..=nn) {
                let diff = a[j - 1] - bi
                let av = if (diff >= 0) { diff } else { -diff }
                let matched = prev[j - 1] + y * av
                let deleted = A[j - 1] + z
                A[j] = if (matched < deleted) { matched } else { deleted }
            }
            var best: Int64 = INF
            for (j in 1..=nn) {
                let cand = A[j] + (nn - j) * z
                if (cand < best) {
                    best = cand
                }
            }
            let start = x + best
            cur[0] = start
            for (j in 1..=nn) {
                let viaDelete = start + j * z
                cur[j] = if (A[j] < viaDelete) { A[j] } else { viaDelete }
            }
            for (j in 0..=nn) {
                prev[j] = cur[j]
            }
        }
        var ans: Int64 = INF
        for (j in 0..=nn) {
            let cand = prev[j] + (nn - j) * z
            if (cand < ans) {
                ans = cand
            }
        }
        println(ans)
    }
}
```

</details>
