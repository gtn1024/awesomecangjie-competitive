---
oj: dmy
pid: '526'
title: '[R82D] 控制'
difficulty: 提高
tags:
  - 计数
  - 哈希
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$2 \le n \le 2\times 10^5$，$1 \le m \le 2\times 10^5$，$0 \le e \le 2\times 10^5$。

## 思路

把每台设备 $v$ 看成它关联的控制器集合 $S_v$。选中两台控制器 $\{a,b\}$ 后，设备 $v$ 能完成检查当且仅当 $S_v\subseteq\{a,b\}$。因此只有 $|S_v|\le 2$ 的设备有可能被算进答案：

- $|S_v|=0$：与选择无关，恒计入，设有 $z$ 台；
- $|S_v|=1$，$S_v=\{u\}$：计入当且仅当 $u\in\{a,b\}$；
- $|S_v|=2$，$S_v=\{u,w\}$：计入当且仅当 $\{a,b\}=\{u,w\}$；
- $|S_v|\ge 3$：永远不计入。

记 $c_u$ 为满足 $S_v=\{u\}$ 的设备数，$t_{u,w}$ 为满足 $S_v=\{u,w\}$（$u<w$）的设备数，则答案为
$$
z+\max_{a<b}\bigl(c_a+c_b+t_{a,b}\bigr).
$$

直接枚举 $O(n^2)$ 对不可行，按 $t_{a,b}$ 是否为零分两类处理：

1. **$t_{a,b}=0$ 的对。** 此时值就是 $c_a+c_b$，最大者取 $c$ 中最大的两个（控制器互不相同）之和 $M_1+M_2$。
2. **$t_{a,b}>0$ 的对。** 这样的对必定来自某台 $|S_v|=2$ 的设备，数量只有 $O(m)$ 个：把每台二度设备给出的无序对 $(u,w)$ 编码成 $u\cdot(n+1)+w$（$u<w$），用哈希表统计每个编码出现的次数，累加出来的次数就是 $t_{u,w}$；计数结束后遍历哈希表中出现过的键，逐对计算 $c_u+c_w+t_{u,w}$。哈希表用开放寻址实现，容量取不小于 $2e$ 的 $2$ 的幂，键乘以大奇数后把高位折叠进低位再与容量减一取与，冲突时线性探测，因此每次插入与查询均摊 $O(1)$。

两类取最大值即为答案。$t_{a,b}>0$ 的对如果恰好也是 $c$ 最大的两台，会同时被两类覆盖，取最大不会出错，也不会漏解。

需要注意的是 $|S_v|\ge 3$ 的设备在统计时就应丢弃：它既不能贡献 $c$，也不能贡献 $t$，否则会让某对控制器的得分虚高。

## 复杂度

时间为 $O(n+m+e)$ 期望：$e$ 条记录读入后，二度设备的对以均摊 $O(1)$ 的代价插入哈希表，再遍历容量与 $e$ 同阶的哈希表求最大值，$c$ 的最大两个值也只需扫一遍；空间为 $c$、设备度数、每台设备的前两个控制器以及哈希表的键与计数，均为 $O(n+m+e)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*

var gdata = Array<Byte>(0, { _ => 0 })
var gpos: Int64 = 0

func nextInt(): Int64 {
    while (gpos < gdata.size && Int64(gdata[gpos]) <= 32) {
        gpos += 1
    }
    var x: Int64 = 0
    while (gpos < gdata.size && Int64(gdata[gpos]) > 32) {
        x = x * 10 + Int64(gdata[gpos]) - 48
        gpos += 1
    }
    return x
}

main() {
    gdata = getStdIn().readToEnd().getOrThrow().toArray()
    let n = nextInt()
    let m = nextInt()
    let e = nextInt()
    let c = Array<Int64>(n + 1, { _ => 0 })
    let deg = Array<Int64>(m + 1, { _ => 0 })
    let f1 = Array<Int64>(m + 1, { _ => 0 })
    let f2 = Array<Int64>(m + 1, { _ => 0 })
    for (_ in 0..e) {
        let u = nextInt()
        let v = nextInt()
        deg[v] += 1
        if (deg[v] == 1) {
            f1[v] = u
        } else if (deg[v] == 2) {
            f2[v] = u
        }
    }
    let base = n + 1
    var cap: Int64 = 8
    while (cap < 2 * e + 2) {
        cap = cap * 2
    }
    let mask = cap - 1
    let hkey = Array<Int64>(cap, { _ => -1 })
    let hcnt = Array<Int64>(cap, { _ => 0 })
    var z: Int64 = 0
    for (v in 1..=m) {
        let d = deg[v]
        if (d == 0) {
            z += 1
        } else if (d == 1) {
            c[f1[v]] += 1
        } else if (d == 2) {
            var a = f1[v]
            var b = f2[v]
            if (a > b) {
                let t = a
                a = b
                b = t
            }
            let k = a * base + b
            let sq = k * 1000003
            var idx = (sq ^ (sq >> 17)) & mask
            while (true) {
                if (hkey[idx] == k) {
                    hcnt[idx] += 1
                    break
                }
                if (hkey[idx] == -1) {
                    hkey[idx] = k
                    hcnt[idx] = 1
                    break
                }
                idx = (idx + 1) & mask
            }
        }
    }
    var best1: Int64 = 0
    var best2: Int64 = 0
    for (u in 1..=n) {
        let x = c[u]
        if (x > best1) {
            best2 = best1
            best1 = x
        } else if (x > best2) {
            best2 = x
        }
    }
    var ans = z + best1 + best2
    for (idx in 0..cap) {
        let k = hkey[idx]
        if (k >= 0) {
            let a = k / base
            let b = k % base
            let val = z + c[a] + c[b] + hcnt[idx]
            if (val > ans) {
                ans = val
            }
        }
    }
    println(ans)
}
```

</details>
