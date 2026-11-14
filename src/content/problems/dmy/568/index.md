---
oj: dmy
pid: '568'
title: '鼠标输入密码'
difficulty: 提高
tags:
  - 线性 DP
timeLimit: 1s
memoryLimit: 256m
---

> 数据规模：$1 \le T \le 10^4$，$1 \le n,m \le 3000$，$0 \le x,y,z \le 10^6$，$0 \le a_i,b_i \le 10^9$，$\sum nm \le 9 \times 10^6$，$\sum (n+m) \le 2 \times 10^5$。

## 思路

**最终形态只由粘贴次数决定。** 粘贴永远是把完整的 $a$ 追加到末尾，滚动只改某个元素的值，删除只去掉某个元素、其余元素相对顺序不变。所以粘贴 $k$ 次之后，编辑区必然是 $a$ 连写 $k$ 遍；要让它变成 $b$，等价于说 $b$ 是这份长序列的子序列：删掉其余 $kn-m$ 个元素，再把保留下来的每个元素各自滚动到对应的 $b$ 值。一份方案的费用是

$$kx+(kn-m)z+y\sum_{t=1}^{m}\lvert a_{p_t}-b_t\rvert,$$

其中 $p_1<p_2<\cdots<p_m$ 是保留下来的元素在「$a$ 重复 $k$ 遍」中的位置，$t$ 表示它被用来配 $b$ 的第 $t$ 项。

若某份拷贝一个元素都没留下，删掉它的全部 $n$ 个元素再取消这次粘贴，能省下 $x+nz\ge 0$，所以最优解中每份拷贝至少留下一个元素，即 $k\le m$；同时 $kn\ge m$。

**处理顺序可以重排。** 每份拷贝在编辑区里的位置只取决于它是第几次粘贴，与何时粘贴无关；滚动和删除又都只作用于单个元素。所以总可以规定：先把当前副本从左到右处理完，再粘贴下一份，费用不变。

**状态。** 设 $f[i][j]$ 表示已经配好 $b$ 的前 $i$ 个元素、当前这份拷贝的前 $j$ 个元素都已处理完（每个要么被删除、要么被匹配）时的最小费用，粘贴费与到此刻为止的删除、滚动费都已付清。$j=0$ 表示这份拷贝刚粘贴、一个元素都还没处理。

在同一份拷贝内有三种动作：

- $j<n$ 时删掉第 $j+1$ 个元素，花 $z$；
- 把第 $j+1$ 个元素滚动成 $b_{i+1}$ 并与之匹配，花 $y\lvert a_{j+1}-b_{i+1}\rvert$，同时 $i$ 增加 $1$；
- 当前副本用完（$j=n$）后换一份，花 $x$。

**层内成环的处理。** 直接按上面三条递推，层 $i$ 内会形成 $(i,0)\to (i,1)\to\cdots\to(i,n)\to(i,0)$ 的环。但从任意 $j$ 绕回 $j$ 一圈的增量是 $x+(n-j)z\ge 0$，绕圈只会更贵，所以最优路径里不会出现绕圈，可以只在「不绕圈」的范围内计算。

固定层 $i$（$b$ 的前 $i$ 个已配好，待配的是 $b_i$，下标从 $1$ 起），先算「本层不再新粘贴」的值：

$$A[0]=+\infty,\qquad A[j]=\min\big(A[j-1]+z,\ f_{i-1}[j-1]+y\lvert a_j-b_i\rvert\big).$$

第一项是删掉第 $j$ 个元素；第二项是把第 $j$ 个元素改成 $b_i$ 并配掉它，于是从上一层「处理到 $j-1$」的状态过来。这两项穷尽了 $A[j]$ 的来源，所以 $A[j]$ 就是本层不含新粘贴的真实值。

**本层新粘贴的起点。** 想在本层再粘贴一份，必须先把当前副本剩下的元素删完：若停在 $A[j]$，要付 $(n-j)z$ 的删除费再加 $x$。于是

$$S_i=x+\min_{1\le j\le n}\big(A[j]+(n-j)z\big).$$

$j$ 从 $1$ 取起：$j=0$ 意味着本层一个元素都没处理就去了 $f[i][0]$，那正是 $A$ 递推里已经包含的「从上一层粘贴过来」。而 $A[n]$ 本身等于 $\min_{j}(A[j]+(n-j)z)$（$A$ 是逐位加 $z$ 递推出来的），所以代码里也可以直接取 $x+A[n]$。有了 $S_i$ 后

$$f_i[0]=S_i,\qquad f_i[j]=\min\big(A[j],\ S_i+jz\big)\quad(1\le j\le n),$$

第二项是「本层刚粘贴一份，把它前 $j$ 个元素直接删掉」。

**为什么两项就够。** 对 $j$ 归纳即可：若 $f_i[j-1]=\min(A[j-1],\,S_i+(j-1)z)$，则

$$f_i[j]=\min\big(f_i[j-1]+z,\ f_{i-1}[j-1]+y\lvert a_j-b_i\rvert\big)=\min\big(A[j],\,S_i+jz\big),$$

因为 $A[j]$ 恰好就是右边括号里前两项的合并。基例 $f_i[0]=S_i=\min(+\infty,S_i)$ 也吻合。特别地，「新粘贴一份、删掉前 $j$ 个、再在第 $j+1$ 个位置匹配」这种走法并没有被漏掉：它先以 $S_i+jz$ 的形式进入 $f_i[j]$，再由下一层的 $A$ 递推接到匹配动作上。

**边界与答案。** 第 $0$ 层还没配任何 $b$，只能先粘贴再删，$f_0[j]=x+jz$。配完 $m$ 个元素后，当前副本剩下的 $n-j$ 个元素必须删掉，所以

$$\text{ans}=\min_{0\le j\le n}\big(f_m[j]+(n-j)z\big).$$

其中 $j=0$ 那一项对应「配完之后又粘贴一份、再整份删掉」，其值 $S_m+nz$ 不小于直接收尾的走法，一并参与取最小不影响结果。

$x,y,z$ 都可能为 $0$，推导中只用到 $x,z\ge 0$ 来排除绕环变优，没有假设费用为正。

## 复杂度

每组数据时间 $O(nm)$，总时间 $O(\sum nm)\le 9\times 10^6$。滚动数组加一个临时数组，额外空间 $O(n)$。

## 仓颉实现

用两个长度 $n+1$ 的数组滚动保存相邻两层：先把 $A[j]$ 就地算进当前层的数组，再扫一遍求出 $S_i$，最后与 $S_i+jz$ 取较小值合并成新的 $f_i$，然后交换两个数组。最大费用约为 $m\cdot y\cdot 10^9\approx 3\times 10^{18}$，必须用 64 位整数，$\infty$ 取 $4\times 10^{18}$，加上 $z$ 也不会溢出。

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*

func solve(reader: ConsoleReader) {
    let INF: Int64 = 4000000000000000000
    let head = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = head[0]
    let m = head[1]
    let x = head[2]
    let y = head[3]
    let z = head[4]
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let b = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })

    // prev[j]：已配好前 i 个 b，当前副本处理完前 j 个元素的最小费用
    var prev = Array<Int64>(n + 1, { k: Int64 => x + k * z })
    var cur = Array<Int64>(n + 1, { _ => 0 })
    for (i in 0..m) {
        let bi = b[i]
        // 先在 cur 里算出「本层不新粘贴」的代价 A[j]
        var last: Int64 = INF
        cur[0] = INF
        for (j in 1..=n) {
            let d = a[j - 1] - bi
            let diff = if (d >= 0) { d } else { -d }
            let matched = prev[j - 1] + y * diff
            let deleted = last + z
            let now = if (matched < deleted) { matched } else { deleted }
            cur[j] = now
            last = now
        }
        // 本层新粘贴一份：先删掉当前副本剩下的元素，再付粘贴费
        var best: Int64 = INF
        for (j in 1..=n) {
            let cand = cur[j] + (n - j) * z
            if (cand < best) {
                best = cand
            }
        }
        let start = x + best
        cur[0] = start
        for (j in 1..=n) {
            let straight = start + j * z
            if (straight < cur[j]) {
                cur[j] = straight
            }
        }
        let tmp = prev
        prev = cur
        cur = tmp
    }

    var ans: Int64 = INF
    for (j in 0..=n) {
        let cand = prev[j] + (n - j) * z
        if (cand < ans) {
            ans = cand
        }
    }
    println(ans)
}

main() {
    let reader = getStdIn()
    let t = Int64.parse(reader.readln().getOrThrow())
    for (_ in 0..t) {
        solve(reader)
    }
}
```

</details>
